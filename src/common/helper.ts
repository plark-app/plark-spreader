export async function wait(delay: number = 1000): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, delay));
}
