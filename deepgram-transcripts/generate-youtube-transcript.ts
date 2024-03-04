import { createClient } from '@deepgram/sdk';
import { join } from 'path';
const apiKey = process.env.DEEPGRAM_API_KEY;
if (!apiKey) {
	throw new Error('No Deepgram API key found');
}

const transcribe = async ({ filePath }: { filePath: string }) => {
	const fullPath = join(process.cwd(), './audios', filePath);
	const file = Bun.file(fullPath);
	const exists = await file.exists();
	if (!exists) {
		throw new Error('File does not exist');
	}
	const deepgram = createClient(apiKey);
	const arrayBuffer = await file.arrayBuffer();
	// convert arraybuffer to buffer
	const buffer = Buffer.from(arrayBuffer);
	const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
		buffer,
		{
			model: 'nova-2',
			language: 'fr',
			smart_format: true,
			punctuate: true,
			paragraphs: true,
			filler_words: true,
		}
	);

	if (error) {
		console.error(error);
	} else {
		const removeExtensionToPath = filePath.split('.').slice(0, -1).join('.');
		const path = join(
			process.cwd(),
			'./audios',
			removeExtensionToPath + '.json'
		);
		const bytes = await Bun.write(path, JSON.stringify(result));
		console.log(result.results.channels[0].alternatives[0]);
		// console.dir(result, { depth: null });
	}
};

transcribe({
	filePath: 'new-project.mp3',
});
